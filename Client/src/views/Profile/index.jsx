import { useSelector, useDispatch } from "react-redux";
import React, { useState } from "react";
import { Avatar, Card, Button, Form, Input, Upload, message } from "antd";
import Meta from "antd/lib/card/Meta";
import { UploadOutlined } from "@ant-design/icons";
import "./style.css";
import { uploadFile } from "react-s3";
import { editProfile } from "../../reducers/authReducer";
import notificationsService from "../../services/notifications";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [mobile, setMobile] = useState(user.mobile);
  const [userName, setUserName] = useState(user.username);
  const [photo, setPhoto] = useState(user.photo);
  const [active, setActive] = useState(true);

  const onNameChange = (e) => setName(e.target.value);
  const onEmailChange = (e) => setEmail(e.target.value);
  const onUserNameChange = (e) => setUserName(e.target.value);
  const onMobileChange = (e) => setMobile(e.target.value);

  const onsave = () => {
    const newPhoto =
      typeof photo === "object" && photo.originFileObj
        ? `${user._id}/${photo.name}`
        : user.photo;

    dispatch(
      editProfile({
        name,
        email,
        username: userName,
        mobile,
        photo: newPhoto,
      })
    );
  };

  // S3 config
  const S3_BUCKET = "";
  const REGION = "";
  const ACCESS_KEY = "";
  const SECRET_ACCESS_KEY = "";

  const config = {
    bucketName: S3_BUCKET,
    region: REGION,
    dirName: "users_profile_photo/" + user._id,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  };

  const beforeUpload = (file) => {
    const isJpgOrPng =
      file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return Upload.LIST_IGNORE;
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error("Image must smaller than 1MB!");
      return Upload.LIST_IGNORE;
    }
    setPhoto(file);
    setActive(false);
    return false; // prevent auto upload
  };

  const handleUpload = async () => {
    if (!photo || !photo.originFileObj) {
      message.error("Please select a photo first!");
      return;
    }

    try {
      await uploadFile(photo.originFileObj, config);
      message.success("Photo uploaded successfully!");
      setActive(true);
    } catch (err) {
      console.error(err);
      message.error("Upload failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-body">
          <div className="avatar">
            <Meta
              avatar={<Avatar size="large" src={user.photo} />}
              title={user.name}
            />
          </div>
          <h5 className="card-title">{"Role: " + user.role}</h5>
          <h5 className="card-text">{"@" + user.username}</h5>
          <p className="card-text">
            {user.email}
            <br />
            <span className="phone">{user.mobile}</span>
          </p>
        </div>
        <span>User's Bio</span>
      </div>

      <Card className="Form">
        <Form size="middle" colon labelAlign="left" layout="vertical">
          <Form.Item label="Name:">
            <Input value={name} onChange={onNameChange} allowClear />
          </Form.Item>
          <Form.Item label="User Name:">
            <Input value={userName} onChange={onUserNameChange} allowClear />
          </Form.Item>
          <Form.Item label="Email:">
            <Input value={email} onChange={onEmailChange} allowClear />
          </Form.Item>
          <Form.Item label="Mobile:">
            <Input value={mobile} onChange={onMobileChange} allowClear />
          </Form.Item>

          <Form.Item label="Photo:">
            <Upload
              beforeUpload={beforeUpload}
              maxCount={1}
              showUploadList={{ showRemoveIcon: true }}
            >
              <Button icon={<UploadOutlined />}>Choose Image</Button>
            </Upload>
            <Button
              style={{ marginTop: "8px" }}
              onClick={handleUpload}
              disabled={active}
            >
              Upload!
            </Button>
          </Form.Item>

          <Button disabled={!active} onClick={onsave} loading={!active}>
            Save Changes
          </Button>

          <Button
            className="unsub"
            type="text"
            onClick={() => notificationsService.unsubscribe()}
            title="Re-login to subscribe again!!"
          >
            Unsubscribe from notifications on all devices
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
