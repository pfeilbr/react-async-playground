import React, { useState } from "react";
import { Router, Link } from "@reach/router";
import { useAsync, Async } from "react-async";

const users = [
  {
    id: "0",
    username: "jdoe"
  },
  {
    id: "1",
    username: "tjones"
  },
  {
    id: "2",
    username: "hsalor"
  }
];

const fetchUser = async ({ id }, { signal }) => {
  await sleep(500);
  return users.filter(user => user.id === id)[0];
};

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

  return (
    <UsersContext.Provider
      value={{ users: data.users, error, isPending, isSettled, reload }}
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

const User = ({ id, children }) => {
  const state = useAsync({ promiseFn: fetchUser, id });
  return children(state);
};

const UserListItem = props => {
  return (
    <div>
      <strong>username</strong>:{" "}
      <span>
        <Link to={`/user/${props.id}`}>{props.username}</Link>
      </span>
    </div>
  );
};

const UserList = () => {
  const { users, error, isPending, isSettled } = useUsers();
  return (
    <>
      <div>users list</div>
      <br />
      {isPending && "Loading..."}
      {error && <p>{error.message}</p>}
      {isSettled && users && (
        <div>
          {users.map(user => (
            <UserListItem key={user.id} {...user} />
          ))}
        </div>
      )}
      <br />
      <Link to="/add-user">add user</Link>
    </>
  );
};

const UserDetail = props => {
  return (
    <>
      <Link to="/users">users list</Link>
      <br />
      <br />
      <User id={props.id}>
        {({ isPending, data, error }) => {
          if (isPending) return "Loading...";
          if (error) return <p>{error.message}</p>;
          if (data) {
            return (
              <div>
                <strong>username</strong>: <span>{data.username}</span>
              </div>
            );
          }
          return null;
        }}
      </User>
    </>
  );
};

const addUser = async ([user]) => {
  await sleep(1000);
  user.id = parseInt(users[users.length - 1].id) + 1;
  users.push(user);
  return user;
};

const UserForm = props => {
  const { navigate } = props;
  const { isPending, error, run, promise } = useAsync({ deferFn: addUser });
  const [username, setUsername] = useState("");
  const { reload: reloadUsers } = useUsers();

  const handleSubmit = async event => {
    event.preventDefault();
    run({ username });
    reloadUsers();
    navigate(`/users`);
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
      <Router>
        <UserList path="/users" />
        <UserForm path="/add-user" />
        <UserDetail path="/user/:id" />
      </Router>
    </UsersProvider>
  );
}

export default App;
