"use client";

import { useState, useEffect, useRef } from "react";
import { CrossmintPaymentElement } from "@crossmint/client-sdk-react-ui";
import { JSONTree } from "react-json-tree";
import Minting from "./minting";

function App() {
  const [orderIdentifier, setOrderIdentifier] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   if (events.length) {
  //     ref.current?.scrollIntoView({
  //       behavior: "smooth",
  //       block: "end",
  //     });
  //   }
  // }, [events.length]);

  useEffect(() => {
    if (events.length && ref.current) {
      // Calculate the new scroll position
      const newScrollPosition =
        ref.current.scrollHeight - ref.current.clientHeight;

      // Smooth scroll to the new position
      ref.current.scrollTo({
        top: newScrollPosition,
        behavior: "smooth",
      });
    }
  }, [events.length]);

  return (
    <div className="grid grid-cols-3 grid-flow-col gap-5">
      <div className="grid col-span-2 p-1">
        {orderIdentifier === null ? (
          <CrossmintPaymentElement
            projectId="e56a55e2-d4b1-4701-8709-2af6a73d9bb5"
            collectionId="849002d8-83a0-4a80-886c-17360f067f93"
            environment="staging"
            emailInputOptions={{
              show: true,
            }}
            mintConfig={{
              _quantity: "1",
              totalPrice: "0.0001",
              _id: "3",
            }}
            onEvent={(event) => {
              setEvents((events) => [...events, event]);
              switch (event.type) {
                case "payment:process.succeeded":
                  console.log(event);
                  setOrderIdentifier(event.payload.orderIdentifier);
                  break;
                default:
                  console.log(event.type, event);
                  break;
              }
            }}
          />
        ) : (
          <Minting
            orderIdentifier={orderIdentifier}
            events={events}
            setEvents={setEvents}
          />
        )}
      </div>
      <div className="col-span-1">
        <div className="flex-row overflow-y-auto event-window">
          {events.map((event, index) => {
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center w-full"
              >
                <div className="flex items-center justify-between w-full event-title font-mono font-bold text-white">
                  {event.type}
                </div>
                <div className="flex w-full text-secondary-text event-viewer">
                  <JSONTree hideRoot data={event} />
                </div>
              </div>
            );
          })}
          <div ref={ref} />
        </div>
      </div>
    </div>
  );
}

export default App;
