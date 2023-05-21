import { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { FormMode, ActionTypes, IMenuFormProps, IMenu } from "menus/types";

import { useMenuDispatch } from "menus/MenuProvider";

const MenuForm = ({ mode, menu, submitForm, children }: IMenuFormProps) => {

  const viewing = mode === FormMode.viewing;
  const editing = mode === FormMode.editing;
  const adding = mode === FormMode.adding;

  const dispatch = useMenuDispatch();

  const closeForm = () => {
    dispatch({ type: ActionTypes.CLOSE_MENU_FORM })
  }

  const cancelForm = () => {
    dispatch({ type: ActionTypes.CANCEL_MENU_FORM })
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: menu,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
    }),
    onSubmit: (values: IMenu) => {
      // console.log('MenuForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values)
      //props.handleClose(false);
    }
  });

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current!.focus()
  }, [nameRef])

  return (
    <div className="form-wrapper p-2">
      <CloseButton onClick={closeForm} className="float-end" />
      <Form onSubmit={formik.handleSubmit}>
        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            as="input"
            placeholder="New Menu"
            name="title"
            ref={nameRef}
            onChange={formik.handleChange}
            value={formik.values.title}
            style={{ width: '100%' }}
            disabled={viewing}
          />
          <Form.Text className="text-danger">
            {formik.touched.title && formik.errors.title ? (
              <div className="text-danger">{formik.errors.title}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group>
          <Form.Label>Number of Meals </Form.Label>
          <div className="text-secondary">{formik.values.numOfMeals}</div>
          {/* <div className="p-1 bg-dark text-white">{createdBy}, {formatDate(created.date)}</div> */}
        </Form.Group>



        {(viewing || editing) &&
          <CreatedModifiedForm
            created={menu.created}
            createdBy={menu.createdBy}
            modified={menu.modified}
            modifiedBy={menu.modifiedBy}
            classes="text-secondary"
          />
        }

        {(editing || adding) &&
          <FormButtons
            cancelForm={cancelForm}
            handleSubmit={formik.handleSubmit}
            title={children}
          />
        }
      </Form>
    </div >
  );
};

export default MenuForm;