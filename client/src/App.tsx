import { useEffect } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route, redirect, useLocation, useNavigate } from "react-router-dom";

import { Navigation } from 'Navigation'
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider'

import './App.css';

import Categories from "categories/Categories"
import RegisterForm from 'global/RegisterForm';
import LoginForm from 'global/LoginForm';
import About from 'About';
import Health from 'Health';
import { Types } from 'mongoose';
import Menus from 'menus/Menus';
import Todos from 'todos/Todos';

function App() {

  const { signInUser } = useGlobalContext();
  const { isAuthenticated, everLoggedIn } = useGlobalState()

  const formInitialValues = {
    wsName: 'MySPACE',
    wsId: new Types.ObjectId('000000000000000000000000'),
    who: '',
    userName: '',
    password: ''
  };

  let location = useLocation();
  const navigate = useNavigate();

  const locationPathname = location.pathname;

  useEffect(() => {
    (async () => {
      const isAuthRoute =
        locationPathname.startsWith('/register') ||
        locationPathname.startsWith('/sign-in') ||
        locationPathname.startsWith('/about');  // allow about without registration

      if (!isAuthenticated && !isAuthRoute) {
        if (!everLoggedIn) {
          const returnUrl = encodeURIComponent(locationPathname);
          if (!locationPathname.includes('/register'))
            navigate('/register/' + returnUrl, { replace: true })
        }
      }
    })()
  }, [signInUser, isAuthenticated, everLoggedIn, locationPathname, navigate])

  return (
    <Container fluid className="App">
      <header className="App-header">
        <Navigation />
      </header>
      <Row>
        <Col md={12}>
          <div className="wrapper">
            <Routes>
              <Route path="/" element={(!isAuthenticated && !everLoggedIn) ? <About /> : <Categories />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/todos" element={<Todos />} />
              <Route path="/menus" element={<Menus />} />
              <Route path="/register/:returnUrl" element={<RegisterForm />} />
              <Route path="/sign-in" element={<LoginForm initialValues={formInitialValues} />} />
              <Route path="/about" element={<About />} />
              <Route path="/health" element={<Health />} />
            </Routes>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
