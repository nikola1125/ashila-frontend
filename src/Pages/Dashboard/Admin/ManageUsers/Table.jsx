import React from 'react';
import {
  QueryClient,
  useMutation,
} from '@tanstack/react-query';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Table = ({ users }) => {
  const { privateApi } = useAxiosSecure();


  const updateRole = async ({ newRole, id }) => {
    await privateApi.patch(`/users/${id}`, { role: newRole });
  };

  const mutation = useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      toast.success('Role Updated');
    },
    onError: () => toast.error('Something Went Wrong'),
  });

  const handleRoleChange = (e, id) => {
    const newRole = e.target.value;

    Swal.fire({
      title: 'Are you sure?',
      text: 'You are changing the role',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        mutation.mutate({ newRole, id });
      }
    });
  };
  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>
              <label>#</label>
            </th>
            <th>Profile</th>
            <th>Name</th>
            <th>Email</th>
            <th>Select Role</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {users?.map((user, index) => (
            <tr key={user._id}>
              <th>
                <label>{index + 1}</label>
              </th>
              <td>
                <div className="avatar">
                  <div className="mask mask-squircle h-12 w-12">
                    <img
                      src={user.photoURL}
                      alt="Avatar Tailwind CSS Component"
                    />
                  </div>
                </div>
              </td>
              <td>
                <p>{user.name}</p>
              </td>
              <td>{user.email}</td>
              <th>
                <select
                  onChange={(e) => handleRoleChange(e, user._id)}
                  defaultValue={user.role}
                  className="select capitalize"
                >
                  <option disabled={true}>{user.role}</option>
                  {user.role === 'user' && (
                    <>
                      <option value="admin">Admin</option>
                      <option value="seller">Seller</option>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <option value="seller">seller</option>
                      <option value="user">User</option>
                    </>
                  )}
                  {user.role === 'seller' && (
                    <>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </>
                  )}
                </select>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
