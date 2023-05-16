import { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton, Dropdown } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { ActionTypes, FormMode, IMenu, IMeal, IMealFormProps } from "menus/types";

import { Select } from 'common/components/Select';
import { sourceOptions } from 'common/sourceOptions'
import { statusOptions } from 'common/statusOptions'
import CatList from 'menus/components/selectMenu/CatList'


import { useMenuDispatch } from "menus/MenuProvider";

const MealForm = ({ mode, meal, submitForm, children }: IMealFormProps) => {

  const viewing = mode === FormMode.viewing;
  const editing = mode === FormMode.editing;
  const adding = mode === FormMode.adding;

  const { title, _id } = meal;

  const dispatch = useMenuDispatch();

  const closeForm = () => {
    dispatch({ type: ActionTypes.CLOSE_MEAL_FORM, payload: { meal } })
  }

  const cancelForm = () => {
    dispatch({ type: ActionTypes.CANCEL_MEAL_FORM, payload: { meal } })
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: meal,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
    }),
    onSubmit: (values: IMeal) => {
      //alert(JSON.stringify(values, null, 2));
      console.log('MealForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values)
      //props.handleClose(false);
    }
  });

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    nameRef.current!.focus()
  }, [nameRef])

  const isDisabled = mode === FormMode.viewing;

  const setParentMenu = (cat: IMenu) => {
    formik.setFieldValue('parentMenu', cat._id!);
    formik.setFieldValue('menuTitle', cat.title);
  }

  return (
    <div className="form-wrapper px-3 py-0 my-0 mb-1 w-100">
      <CloseButton onClick={closeForm} className="float-end" />
      <Form onSubmit={formik.handleSubmit}>

      <Form.Label>Menu</Form.Label>
        <Form.Group controlId="parentMenu" className="menu-select form-select-sm">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-basic" className="px-1 py-1 text-primary" disabled={isDisabled}>
              {formik.values.menuTitle}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-0">
              <Dropdown.Item className="p-0 m-0 rounded-3">
                <CatList
                  parentMenu={null}
                  level={1}
                  setParentMenu={setParentMenu}
                />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Form.Control
            as="input"
            name="parentMenu"
            onChange={formik.handleChange}
            value={formik.values.parentMenu.toString()}
            placeholder='Menu'
            className="text-primary w-100"
            disabled={isDisabled}
            hidden={true}
          />
          <Form.Text className="text-danger">
            {formik.touched.parentMenu && formik.errors.parentMenu ? (
              <div className="text-danger">{formik.errors.parentMenu ? 'required' : ''}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            as="textarea"
            name="title"
            ref={nameRef}
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.title}
            rows={2}
            placeholder='New Meal'
            className="text-primary w-100"
            disabled={isDisabled}
          />
          <Form.Text className="text-danger">
            {formik.touched.title && formik.errors.title ? (
              <div className="text-danger">{formik.errors.title}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="source">
          <Form.Label>Source</Form.Label>
          <Select
            id="source"
            name="source"
            options={sourceOptions}
            onChange={(e, value) => {
              formik.setFieldValue('source', value)
                .then(() => { if (editing) formik.submitForm() })
            }}
            value={formik.values.source}
            disabled={isDisabled}
            classes="text-primary"
          />
          <Form.Text className="text-danger">
            {formik.touched.source && formik.errors.source ? (
              <div className="text-danger">{formik.errors.source}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="status">
          <Form.Label>Status</Form.Label>
          <Select
            id="status"
            name="status"
            options={statusOptions}
            //onChange={formik.handleChange}
            onChange={(e, value) => {
              formik.setFieldValue('status', value)
                .then(() => { if (editing) formik.submitForm() })
            }}
            value={formik.values.status}
            disabled={isDisabled}
            classes="text-primary"
          />
          <Form.Text className="text-danger">
            {formik.touched.status && formik.errors.status ? (
              <div className="text-danger">{formik.errors.status}</div>
            ) : null}
          </Form.Text>
        </Form.Group>


        {(viewing || editing) &&
            <CreatedModifiedForm
              created={meal.created}
              createdBy={meal.createdBy}
              modified={meal.modified}
              modifiedBy={meal.modifiedBy}
              classes="text-primary"
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

export default MealForm;