import React, { useEffect } from "react";
import useSWR from "swr";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import Head from "next/head";
import { animated, useTransition } from "react-spring";

const getJson = (url: string): Promise<any> => {
  return fetch(url).then((r) => r.json());
};

const postJson = (url: string, data: object): Promise<any> => {
  return fetch(url, { method: "POST", body: JSON.stringify(data) }).then((r) =>
    r.json()
  );
};

function classNameFromDaysLeft(daysLeft: number) {
  if (daysLeft < 5) {
    return "bg-yellow";
  } else if (daysLeft < 30) {
    return "bg-washed-yellow";
  } else {
    return "bg-washed-yellow";
  }
}

export default function Index() {
  const { data: chores, mutate } = useSWR(
    "http://localhost:1234/chores",
    getJson
  );

  const bumpDate = async (id: string) => {
    await postJson(`http://localhost:1234/chores/${id}/bump`, {});
    mutate(
      chores.map((chore) => {
        if (chore.id === id) {
          return {
            ...chore,
            last_done: format(new Date(), "yyyy-MM-dd"),
          };
        } else {
          return chore;
        }
      })
    );
  };

  let height = 0;

  const transitions = useTransition(
    (chores || []).map((data) => ({ ...data, y: (height += 57) - 57 })),
    (d) => d.id,
    {
      from: { opacity: 0 },
      leave: { opacity: 0 },
      enter: ({ y }) => ({ y, opacity: 1 }),
      // @ts-ignore
      update: ({ y }) => ({ y }),
    }
  );

  useEffect(() => {
    document.body.classList.add("bg-near-black");

    return () => {
      document.body.classList.remove("bg-near-black");
    };
  });

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Ubuntu&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="pa4" style={{ fontFamily: "'Ubuntu', sans-serif" }}>
        {chores && (
          <>
            <div className="light-gray flex">
              <div className="fl w-100 pa3 bb b--black-20">Name</div>
              <div className="fl w-20 pa3 bb b--black-20">Last Done</div>
              <div className="fl w-20 pa3 bb b--black-20">Next Date</div>
              <div className="fl w-10 pa3 bb b--black-20">Days left</div>
            </div>
            <div className="lh-copy relative" style={{ height }}>
              {transitions.map(
                // @ts-ignore
                ({ item: chore, props: { y, ...rest }, key }, index) => {
                  const daysLeft = differenceInCalendarDays(
                    parseISO(chore.next_date),
                    new Date()
                  );

                  return (
                    <animated.div
                      key={key}
                      className={
                        classNameFromDaysLeft(daysLeft) +
                        " black flex bg-animate hover-bg-green absolute w-100"
                      }
                      style={{
                        zIndex: chores.length - index,
                        transform: y.interpolate(
                          (y) => `translate3d(0,${y}px,0)`
                        ),
                        ...rest,
                      }}
                      onClick={() => bumpDate(chore.id)}
                    >
                      <div className="fl w-100 pa3 bb b--black-20">
                        {chore.task}
                      </div>
                      <div className="fl w-20 pa3 bb b--black-20">
                        {chore.last_done}
                      </div>
                      <div className="fl w-20 pa3 bb b--black-20">
                        {chore.next_date}
                      </div>
                      <div className="fl w-10 pa3 bb b--black-20">
                        {daysLeft}
                      </div>
                    </animated.div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
