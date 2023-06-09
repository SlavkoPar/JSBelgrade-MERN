import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton } from "react-bootstrap";
import { ILoginUser } from "global/types";

import './formik.css';

import { useGlobalContext } from 'global/GlobalProvider'
import { Types } from "mongoose";
import { useNavigate, useParams } from "react-router-dom";

export interface ILoginFormProps {
}

type RegisterParams = {
  returnUrl: string;
};

const RegisterForm = () => {

  const { globalState, registerUser } = useGlobalContext();
  let { returnUrl } = useParams<RegisterParams>();

  let navigate = useNavigate();
  const closeForm = () => {
    navigate('/register'); // '/register' will prevent: navigate('/register/' + returnUrl, { replace: true })
  }

  const goBack = () => {
    navigate(returnUrl && returnUrl !== 'fromNavigation' ? returnUrl : '/')
  }

  const [showMessage, setShowMessage] = useState(false);

  const submitForm = async (loginUser: ILoginUser) => {
    const user = await registerUser(loginUser);
    if (!user)
      return;

    setShowMessage(true)
    // closeForm();
  }

  const initialValues: ILoginUser = {
    wsId: new Types.ObjectId('000000000000000000000000'),
    wsName: 'MySPACE',
    userName: '',
    email: '',
    password: ''
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: Yup.object().shape({
      wsName: Yup.string().required("Required"),
      userName: Yup.string().required("Required"),
      email: Yup.string()
        .required("Required")
        .email("You have enter an invalid email address"),
      password: Yup.string()
        .required("Password is a required field")
        .min(8, "Password must be at least 8 characters")
    }),
    onSubmit: values => {
      //alert(JSON.stringify(values, null, 2));
      submitForm(values)
    }
  });

  // eslint-disable-next-line no-self-compare
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current!.focus()
  }, [nameRef])

  if (showMessage) {
    return (
      <>
        <div className="form bg-warning">
          <p>Small demo database has been created, to better understand relations:</p>
          <p>Category -{">"} Questions</p>
          <p>You can easily remove these records</p>
        </div>
        <div className="form bg-info my-2 py-2">
          <button onClick={goBack} title='Back'>Go Back</button>
        </div>
      </>
    )
  }

  return (
    <div className="form">
      <CloseButton onClick={closeForm} className="float-end" />
      <Form onSubmit={formik.handleSubmit}>
        <span>Register</span>

        <Form.Group controlId="wsName">
          {/* <Form.Label>Title</Form.Label> */}
          <Form.Control
            as="input"
            name="wsName"
            onChange={formik.handleChange}
            value={formik.values.wsName}
            style={{ width: '100%' }}
            placeholder={'Workspace name'}
          />
          <Form.Text className="text-danger">
            {formik.touched.userName && formik.errors.wsName ? (
              <div className="text-danger">{formik.errors.wsName}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="title">
          {/* <Form.Label>Title</Form.Label> */}
          <Form.Control
            as="input"
            name="userName"
            ref={nameRef}
            onChange={formik.handleChange}
            value={formik.values.userName}
            style={{ width: '100%' }}
            placeholder={'Username'}
          />
          <Form.Text className="text-danger">
            {formik.touched.userName && formik.errors.userName ? (
              <div className="text-danger">{formik.errors.userName}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="email">
          {/* <Form.Label>email</Form.Label> */}
          <Form.Control
            as="input"
            name="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            style={{ width: '100%' }}
            placeholder={'name@example.com'}
          />
          <Form.Text className="text-danger">
            {formik.touched.email && formik.errors.email ? (
              <div className="text-danger">{formik.errors.email}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="password">
          {/* <Form.Label>password</Form.Label> */}
          <Form.Control
            as="input"
            name="password"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.password}
            style={{ width: '100%' }}
            placeholder={'pwd'}
          />
          <Form.Text className="text-danger">
            {formik.touched.password && formik.errors.password ? (
              <div className="text-danger">{formik.errors.password}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <button type="submit" className="submit-button">Register</button>

        {globalState.error &&
          <div>{globalState.error.message}</div>
        }

      </Form>

    </div >
  );
};


export default RegisterForm;
