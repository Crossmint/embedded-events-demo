import React from "react";
import { useCrossmintEvents } from "@crossmint/client-sdk-react-ui";

interface MintingProps {
  orderIdentifier: string;
  events: any[];
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
}

const Minting: React.FC<MintingProps> = ({ orderIdentifier, setEvents }) => {
  const [status, setStatus] = React.useState<string>("pending"); // ["pending", "success", "failure"
  const [result, setResult] = React.useState<any>(null);
  const [txnComplete, setTxnComplete] = React.useState<boolean>(false);
  const [orderComplete, setOrderComplete] = React.useState<boolean>(false);
  const [complete, setComplete] = React.useState<boolean>(false);
  const { listenToMintingEvents } = useCrossmintEvents({
    environment: "staging",
  });

  if (orderIdentifier && !complete) {
    // prevent constant polling
    if (txnComplete && orderComplete) {
      setComplete(true);
      return;
    }

    listenToMintingEvents({ orderIdentifier }, (event) => {
      setEvents((events) => [...events, event]);

      switch (event.type) {
        case "transaction:fulfillment.succeeded":
        case "transaction:fulfillment.failed":
          setTxnComplete(true);
          break;
        case "order:process.finished":
          setOrderComplete(true);
          break;
        default:
          break;
      }
      console.log(event.type, ":", event);
    });
  }

  if (status === "pending") {
    listenToMintingEvents({ orderIdentifier }, (event) => {
      switch (event.type) {
        case "transaction:fulfillment.succeeded":
          setStatus("success");
          setResult(event.payload);
          break;
        case "transaction:fulfillment.failed":
          setStatus("failure");
          break;
        default:
          break;
      }
      console.log(event.type, ":", event);
    });
  }

  return (
    <>
      <div className="text-black font-mono p-5 text-center">
        {status === "pending" && (
          <>
            <h3>Minting your NFT...</h3>
            <div className="loading-wrap">
              <div className="loading"></div>
            </div>
            This may take up to a few minutes
          </>
        )}
        {status === "success" && (
          <>
            <h3>NFT Minted Successfully!</h3>
            <div className="mt-10">
              <a
                target="_blank"
                className="block bg-[#2081e2] rounded-lg mt-3 p-3 text-white"
                href={`https://testnets.opensea.io/assets/mumbai/${result?.contractAddress}/${result?.tokenIds[0]}`}
              >
                View on OpenSea
              </a>
              <a
                target="_blank"
                className="block bg-[#663399] rounded-lg mt-3 p-3 text-white"
                href={`https://mumbai.polygonscan.com/tx/${result?.txId}`}
              >
                View on Polygonscan
              </a>
              <a
                target="_blank"
                className="block bg-[#81feab] rounded-lg mt-3 p-3 text-black"
                href={`https://staging.crossmint.com/user/collection/poly:${result?.contractAddress}:${result?.tokenIds[0]}`}
              >
                View in Crossmint
              </a>
            </div>
          </>
        )}
        {status === "failure" && (
          <>
            <h3>Failed to Mint NFT</h3>
            <p>
              Something went wrong. You will be refunded if the mint cannot be
              fulfilled successfully.
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default Minting;
