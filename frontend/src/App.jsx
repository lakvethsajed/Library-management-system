import Home from './Pages/Home';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/login";
import Register from './Pages/Register';
import Books from './Pages/Book'
import Manage from './Pages/managebooks'
import Users from './Pages/users'
import ViewIssue from './Pages/viewissues'
import ViewBook from "./Pages/viewbook";
import MyBooks from './Pages/mybooks'
import GetUser from './Pages/getuser';
function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/books" element={<Books/>}/>
      <Route path="/manage" element={<Manage/>}/>
      <Route path="/users" element={<Users/>}/>
      <Route path='/issues' element={<ViewIssue/>} />
      <Route path="/book/:id" element={<ViewBook />} />
      <Route path='/my-books' element={<MyBooks/>} />
      <Route path='/get-user' element={<GetUser/>}/>
    </Routes>
    </BrowserRouter>
 

)}

export default App;