import { Link, NavLink, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion, faThumbsUp, faUser } from '@fortawesome/free-solid-svg-icons'

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';

import { useGlobalContext, useGlobalDispatch } from 'global/GlobalProvider'
import { GlobalActionTypes } from "global/types";
import { useEffect } from "react";

interface INavigation {
}

export function Navigation(props: INavigation) {

  const { globalState } = useGlobalContext();
  const { authUser, isAuthenticated, isDarkMode, variant, bg } = globalState;
  const { userName } = authUser;

  const dispatch = useGlobalDispatch();

  let navigate = useNavigate();

  const otkaciMe = () => {
    dispatch({ type: GlobalActionTypes.UN_AUTHENTICATE })
    localStorage.removeItem('CATEGORIES_STATE');
    navigate('/about');
  }

  useEffect(() => {
    // if (isAuthenticated)
    //   navigate('/categories')
  }, [navigate, isAuthenticated])

  return (
    <Navbar expand={"md"} variant={variant} bg={bg} collapseOnSelect className="sticky-top">
      <Container fluid>
        <Navbar.Brand href="#" className="ps-3">JSBelgrade MERN CRUD</Navbar.Brand>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand`} />
        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand`}
          aria-labelledby={`offcanvasNavbarLabel-expand`}
          placement="end"
          className={`text-bg-${bg}`}
        >
          {isDarkMode ? (
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand`}>Support</Offcanvas.Title>
            </Offcanvas.Header>
          ) : (
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand`}>Support</Offcanvas.Title>
            </Offcanvas.Header>
          )}

          <Offcanvas.Body>
            <Nav
              className="justify-content-end flex-grow-1 pe-3 d-flex flex-nowrap"
              onSelect={eventKey => {

                switch (eventKey) {
                  case "LIGHT_MODE":
                  case "DARK_MODE":
                    if (document.body.classList.contains('dark')) {
                      document.body.classList.remove('dark')
                      document.body.classList.add('light')
                    }
                    else {
                      document.body.classList.add('dark')
                    }
                    dispatch({ type: eventKey })
                    break;
                }
              }}
            >

              {isAuthenticated &&
                <NavLink to="/categories" className="nav-link">
                  <FontAwesomeIcon icon={faQuestion} color='lightblue' />{' '}Questions
                </NavLink>
              }

              {isAuthenticated &&
                <NavLink to="/todos" className="nav-link">
                  <FontAwesomeIcon icon={faThumbsUp} color='lightblue' />{' '}TODO List
                </NavLink>
              }

              {isAuthenticated &&
                <NavLink to="/menus" className="nav-link">
                  <FontAwesomeIcon icon={faThumbsUp} color='lightblue' />{' '}Meals
                </NavLink>
              }


              {/* {isAuthenticated && [ROLES.OWNER, ROLES.ADMIN].includes(role) &&
                <NavLink to="/workspaces" className="nav-link">
                  <FontAwesomeIcon icon={faUserFriends} color='lightblue' />{' '}Workspace
                </NavLink>
              } */}

              {!isAuthenticated &&
                <NavLink to="/about" className="nav-link">
                  About
                </NavLink>
              }

              {/* <NavDropdown
                title={<><FontAwesomeIcon icon={faCog} color='lightblue' />{' '}Settings</>}
                id={`offcanvasNavbarDropdown-expand`}
                menuVariant={variant}
              >
              </NavDropdown> */}

              {!isAuthenticated &&
                <NavLink to="/register/fromNavigation" className="nav-link">
                  Register
                </NavLink>
              }

              {!isAuthenticated &&
                <NavLink to="/sign-in" className="nav-link">
                  Sign In
                </NavLink>
              }

              {isAuthenticated &&
                <NavDropdown
                  title={<><FontAwesomeIcon icon={faUser} />{' '}{userName}</>}
                  id={`offcanvasNavbarDropdown-expand`}
                  menuVariant={variant}
                  align="end"
                >
                  <NavDropdown.Item eventKey="DARK_MODE">
                    Dark mode
                  </NavDropdown.Item>
                  <NavDropdown.Item eventKey="LIGHT_MODE">
                    Light mode
                  </NavDropdown.Item>

                  <NavDropdown.Divider />

                  <NavDropdown.Item as={Link} to="/health" >
                    Health
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/about" >
                    About
                  </NavDropdown.Item>

                  <NavDropdown.Divider />

                  <NavDropdown.Item href="#" onClick={otkaciMe}>
                    Sign out
                  </NavDropdown.Item>
                </NavDropdown>
              }
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}
