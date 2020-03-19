import React from "react";
import logo from "./logo.svg";
import "./App.css";

import { useAsync, Async } from "react-async";

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

const fetchUser = async ({ id }, { signal }) => {
  await sleep(2000);
  // uncomment the following to force an error
  //throw new Error("server unavailable");
  return {
    id,
    username: "jdoe",
    first: "John",
    last: "Doe"
  };
};

const User = () => {
  return (
    <Async promiseFn={fetchUser} id={1}>
      <Async.Pending>Loading...</Async.Pending>
      <Async.Rejected>
        {error => <div>error: {error.message}</div>}
      </Async.Rejected>
      <Async.Fulfilled>
        {data => (
          <div>
            <strong>Player data:</strong>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </Async.Fulfilled>
    </Async>
  );
};

function App() {
  return (
    <div>
      <User />
    </div>
  );
}

export default App;
