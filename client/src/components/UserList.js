import React from 'react';

const UserList = ({ users }) => (
  <>
    <h4>Registered Users</h4>
    <table className="table table-bordered">
      <thead>
        <tr><th>Name</th><th>Email</th><th>Role</th></tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.isAdmin ? 'Admin' : 'User'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

export default UserList; 