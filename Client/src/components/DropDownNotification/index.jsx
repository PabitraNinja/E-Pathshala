import React from "react";
import { BellFilled, AlertTwoTone } from "@ant-design/icons";
import { Badge, Dropdown, List, Avatar, Empty } from "antd";
import "./DropDownNotification.css";

import { useSelector, useDispatch } from "react-redux";
import { delAll, del } from "../../reducers/notificationsReducer";
import { DateTime } from "luxon";

function getNoticeData(data) {
  return data.map((item) => {
    let avatar;

    if (item.type === "follow" || item.type === "bookmark") {
      avatar =
        "https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png";
    } else if (item.type === "like") {
      avatar =
        "https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png";
    } else if (item.type === "comment") {
      avatar =
        "https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png";
    } else if (item.type === "admin") {
      avatar =
        "https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png";
    } else if (item.type === "alert") {
      avatar = <AlertTwoTone />;
    }

    return {
      id: item._id,
      avatar,
      title: item.type,
      description: item.data,
      datetime: DateTime.fromISO(item.updatedAt).toRelative(),
    };
  });
}

const DropDownNotification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications);

  const handleClear = () => {
    dispatch(delAll());
  };

  const handleItemClick = (item) => {
    dispatch(del(item.id));
  };

  const noticeList = getNoticeData(notifications);

  const menu = (
    <div style={{ width: 300, maxHeight: 400, overflowY: "auto" }}>
      {noticeList.length > 0 ? (
        <>
          <List
            itemLayout="horizontal"
            dataSource={noticeList}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleItemClick(item)}
                style={{ cursor: "pointer" }}
              >
                <List.Item.Meta
                  avatar={
                    typeof item.avatar === "string" ? (
                      <Avatar src={item.avatar} />
                    ) : (
                      item.avatar
                    )
                  }
                  title={item.title}
                  description={
                    <>
                      <div>{item.description}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {item.datetime}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
          <div
            style={{
              textAlign: "center",
              padding: "8px",
              borderTop: "1px solid #f0f0f0",
              cursor: "pointer",
            }}
            onClick={handleClear}
          >
            Clear All
          </div>
        </>
      ) : (
        <Empty
          image="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
          description="You have viewed all notifications"
        />
      )}
    </div>
  );

  return (
    <div className="dropdown-div">
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <Badge count={notifications.length} offset={[10, 0]}>
          <BellFilled style={{ fontSize: 20, cursor: "pointer" }} />
        </Badge>
      </Dropdown>
    </div>
  );
};

export default DropDownNotification;
