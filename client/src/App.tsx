import { useEffect } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route, redirect, useLocation } from "react-router-dom";

import { Navigation } from 'Navigation'
import { useGlobalContext, useGlobalDispatch, useGlobalState } from 'global/GlobalProvider'

import './App.css';

import Categories from "categories/Categories"
import RegisterForm from 'global/RegisterForm';
import LoginForm from 'global/LoginForm';
import About from 'About';
import Health from 'Health';
import { Types } from 'mongoose';
import Menus from 'menus/Menus';

function App() {

  const { signInUser } = useGlobalContext();
  const { authUser, isAuthenticated, everLoggedIn } = useGlobalState()
  const { wsId, wsName, userName, password } = authUser;

  const formInitialValues = {
    wsName: 'MySPACE',
    wsId: new Types.ObjectId('000000000000000000000000'),
    who: '',
    userName: '',
    password: ''
  };

  let location = useLocation();

  useEffect(() => {
    (async () => {
      if (!isAuthenticated) {
        if (everLoggedIn) {
          if (userName !== '') {
            const signedIn = await signInUser({ wsId, wsName, userName, password });
            if (!signedIn && everLoggedIn) {
              return redirect('/sign-in')
            }
          }
        }
        else {
          return redirect('/register')
        }
      }
    })()
  }, [signInUser, isAuthenticated, wsId, wsName, userName, password, everLoggedIn, location.pathname])

  const globalDispatch = useGlobalDispatch();
  useEffect(() => {
    // TODO move this to Categories.tsx when react-router completes event for leaving route
    // if (!location.pathname.startsWith('/categories')) {
    //   globalDispatch({ type: GlobalActionTypes.SET_LAST_CATEGORY_EXPANDED })
    // }
  }, [location, globalDispatch]);

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
              <Route path="/menus" element={<Menus />} />
              <Route path="/register" element={<RegisterForm />} />
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
