import React, { useState } from "react";
import { useAsync, Async } from "react-async";

const users = [
  {
    username: "jdoe"
  }
];

const fetchUsers = async ({}, { signal }) => {
  await sleep(1000);
  // uncomment the following to force an error
  //throw new Error("server unavailable");
  return {
    users
  };
};

const UsersContext = React.createContext();

function UsersProvider(props) {
  const {
    data = { users: [] },
    error,
    isRejected,
    isPending,
    isSettled,
    reload
  } = useAsync({
    promiseFn: fetchUsers
  });

  const reloadUsers = async () => {
    return reload();
  };

  return (
    <UsersContext.Provider
      value={{ users: data.users, reloadUsers }}
      {...props}
    />
  );
}

function useUsers() {
  const context = React.useContext(UsersContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserProvider`);
  }
  return context;
}

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

// const UserList = () => {
//   return (
//     <Async promiseFn={fetchUsers} id={1}>
//       <Async.Pending>Loading...</Async.Pending>
//       <Async.Rejected>
//         {error => <div>error: {error.message}</div>}
//       </Async.Rejected>
//       <Async.Fulfilled>
//         {data => (
//           <div>
//             <strong>Users:</strong>
//             <pre>{JSON.stringify(data, null, 2)}</pre>
//           </div>
//         )}
//       </Async.Fulfilled>
//     </Async>
//   );
// };

const UserList = () => {
  const { users } = useUsers();
  return (
    <div>
      <strong>Users:</strong>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
};

const addUser = async ([user]) => {
  await sleep(1000);
  users.push(user);
};

const UserForm = () => {
  const { isPending, error, run } = useAsync({ deferFn: addUser });
  const [username, setUsername] = useState("");
  const { reloadUsers } = useUsers();

  const handleSubmit = event => {
    event.preventDefault();
    run({ username });
    reloadUsers();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Add New User</h4>
      <label for="username">username:</label>
      <input
        name="username"
        type="text"
        value={username}
        onChange={event => setUsername(event.target.value)}
      />
      <br></br>
      <button type="submit" disabled={isPending}>
        Add
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
};

function App() {
  return (
    <UsersProvider>
      <div>
        <UserList />
        <UserForm />
      </div>
    </UsersProvider>
  );
}

export default App;
