import NavHeader from "../components/navbar";
import "./users.css";
import React from "react";

export default function Users() {

  const [user, setuser] = React.useState([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(()=>{
    const token = localStorage.getItem("token");
    fetch(`http://127.0.0.1:8000/users/all?search=${search}`,{
        headers:{
            "Authorization": `Bearer ${token}`,
        }
    }).then(response => response.json())
       .then((data)=>{
        setuser(data);
       })
       .catch((error)=>{
        console.log("Errors",error)
       });
  },[search]);

    return (
        <>
            <NavHeader />

            <div className="users-page">
                <div className="users-header">
                    <div>
                        <h1>Users</h1>
                        <p>View all registered users in the system.</p>
                    </div>
                </div>
                <div className="users-search">
                    <input type="text" placeholder="Search users by name, username or email..." value={search} onChange={(e) => setSearch(e.target.value)}/>
                    <button>Search</button>
                </div>


                <table className="users-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined On</th>
                            <th>Status</th>
                        </tr>
                    </thead>


                    <tbody>

                        {user.map((user) => (

                            <tr key={user.id}>

                                <td>{user.id}</td>

                                <td>{user.name}</td>

                                <td>{user.username}</td>

                                <td>{user.email}</td>

                                <td>
                                    <span className={`user-role ${user.role}`}>{user.role}</span>
                                </td>

                                <td>
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                                </td>

                                <td>
                                   <td>
                                    <span className={user.is_logged_in ? "active-user" : "inactive-user"}>
                                        {user.is_logged_in ? "Active" : "Inactive"}
                                    </span>
                                    </td>
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>
        </>
    );
}