import { Button } from "react-bootstrap";

type IProps = {
  cancelForm: () => void,  
  title: string, 
  handleSubmit:  () => void
}

export const FormButtons = ({ cancelForm, title, handleSubmit }: IProps) => {
  return (
    <div className="my-0 p-1 d-flex justify-content-end align-items-center" >
      <Button variant="danger" size="sm" type="button" className="ms-2 rounded-1" onClick={cancelForm} >
        Cancel
      </Button>

      <Button variant="primary" size="sm" type="button" className="ms-2 rounded-1" onClick={handleSubmit}>
        {title}
      </Button>
    </div>
  );
};
