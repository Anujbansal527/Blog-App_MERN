import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../Common/filter-pagination-data";
import Loader from "../Components/loader.component";
import AnimationWrapper from "../Common/page-animation";
import NotificationCard from "../Components/notification-card.component";
import NoDataMessage from "../Components/nodata.component";
import LoadMore from "../Components/load-more.component";

const Notification = () => {
  const [filter, setFilter] = useState("all");

  const [notfications, setNotifications] = useState(null);

  let {
    userAuth, setUserAuth,userAuth: { access_token,new_notification_available },
  } = useContext(UserContext);

  let filters = ["all", "like", "comment", "reply"];

  const fetchNotifications = ({ page, deleteDocCount = 0 }) => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/notifications`,
        { page, filter, deleteDocCount },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      .then(async ({ data: { notifications: data } }) => {
        if (new_notification_available) {
            setUserAuth({...userAuth,new_notification_available:false})
        }
        let formatedData = await filterPaginationData({
          state: notfications,
          data,
          page,
          counteRoute: "/all-notification-count",
          data_to_send: { filter },
          user: access_token,
        });

        setNotifications(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token,filter]);

  const FilterHandel = (e) => {
    let btn = e.target;
    setFilter(btn.innerHTML);
    setNotifications(null);
  };

  return (
    <div>
      <h1 className="max-md:hidden">Recent Activity</h1>

      <div className="my-8 flex gap-6">
        {filters.map((filterName, i) => {
          return (
            <button
              key={i}
              className={
                "py-2 " + (filter == filterName ? " btn-dark " : " btn-light ")
              }
              onClick={FilterHandel}
            >
              {filterName}
            </button>
          );
        })}
      </div>

      {notfications == null ? (
        <Loader />
      ) : (
        <>
          {notfications.results.length ? (
            notfications.results.map((notification, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificationState={{ notfications, setNotifications }}
                  />
                </AnimationWrapper>
              );
            })
          ) : (
            <NoDataMessage message={"No Notification Availavable"} />
          )}

          <LoadMore
            state={notfications}
            fetchDataFun={fetchNotifications}
            additionslParam={{ deleteDocCount: notfications.deleteDocCount }}
          />
        </>
      )}
    </div>
  );
};

export default Notification;
