import { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form } from "react-bootstrap";

import { FormButtons } from "common/FormButtons"

import { ActionTypes, IMenuFormProps } from "../types";

import { useMenuDispatch } from "menus/MenuProvider";

const InLineMenuForm = ({ inLine, mode, menu, submitForm, children }: IMenuFormProps) => {
  
  const dispatch = useMenuDispatch();

  const cancelForm = () => {
    dispatch({ type: ActionTypes.CANCEL_MENU_FORM })
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: menu,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
      // email: Yup.string()
      //   .email("You have enter an invalid email address")
      //   .required("Required"),
      // rollno: Yup.number()
      //   .positive("Invalid roll number")
      //   .integer("Invalid roll number")
      //   .required("Required"),
    }),
    onSubmit: values => {
      //alert(JSON.stringify(values, null, 2));
      console.log('InLineMenuForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values)
      //props.handleClose(false);
    }
  });

  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current!.focus()
  }, [titleRef])

  return (

      <div className="d-flex justify-content-start align-items-center primary">  {/* title={_id!.toString()} */}
        <Form onSubmit={formik.handleSubmit} ref={formRef}>
          <Form.Group controlId="title">
            {/* <Form.Label>Title</Form.Label> */}
            <Form.Control
              as="input"
              name="title"
              ref={titleRef}
              onChange={formik.handleChange}
              //onBlur={formik.handleBlur}
              //onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
              // if (isEdit && formik.initialValues.title !== formik.values.title)
              // formik.submitForm();
              //}}
              value={formik.values.title}
              style={{ width: '100%' }}
              placeholder="New Menu"
              size="sm"
            />
            <Form.Text className="text-danger">
              {formik.touched.title && formik.errors.title ? (
                <div className="text-danger">{formik.errors.title}</div>
              ) : null}
            </Form.Text>
          </Form.Group>
        </Form>

        <FormButtons
          cancelForm={cancelForm}
          handleSubmit={formik.handleSubmit}
          title={children}
        />
      </div>
  );
};

export default InLineMenuForm;