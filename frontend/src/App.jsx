import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from './Pages/Contact'
import Login from './Pages/Login'
import Navbar from './Components/Navbar/Navbar'
import ProductView from './Pages/Dinidu/ProductView'
import Checkout from './Pages/Checkout'
import Producadd from './Pages/Dinidu/Productadd'
import Productupdate from './Pages/Dinidu/Productupdate'
import Productlist from './Pages/Dinidu/Productlist'
import Cart from './Pages/Cart'



const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-9vw] '>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/login' element={<Login />} />
        <Route path="/products/:id" element={<ProductView />} />
        <Route path='/checkout' element={<Checkout />} />

        <Route path='/add-product' element={<Producadd />} />
        <Route path='/update-product/:id' element={<Productupdate />} />
         <Route path='/product-list' element={<Productlist />} />
        <Route path='/cart' element={<Cart/>} />


        </Routes>
    </div>
  )
}

export default App

