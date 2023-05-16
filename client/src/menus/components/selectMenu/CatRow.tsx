import { Types } from "mongoose";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { CatsActionTypes, CatsActions } from "menus/types";
import { IMenu } from 'menus/types'

import CatList from "menus/components/selectMenu/CatList";

interface ICatRow {
    menu: IMenu;
    dispatch: React.Dispatch<CatsActions>;
    setParentMenu: (menu: IMenu) => void;
}    

const CatRow = ({ menu, dispatch, setParentMenu }: ICatRow) => {
    const { _id, title, level, isExpanded } = menu;

    const { isDarkMode, variant, bg } = useGlobalState();

    const expand = (_id: Types.ObjectId) => {
        dispatch({ type: CatsActionTypes.SET_EXPANDED, payload: { _id, expanding: !isExpanded } });
    }

    const onSelectMenu = (menu: IMenu) => {
        // Load data from server and reinitialize menu
        // viewMenu(_id);
        setParentMenu(menu);
    }

    const Row1 =
        <div className="d-flex justify-content-start align-items-center w-100 text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                onClick={(e) => {
                    expand(_id!);
                    e.stopPropagation();
                }}
                title="Expand"
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none`}
                title={_id!.toString()}
                onClick={() => onSelectMenu(menu)}
            >
                {title}
            </Button>
        </div>

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {Row1}
            </ListGroup.Item>

            {isExpanded && // Row2
                <ListGroup.Item
                    className="py-0 px-0"
                    variant={"primary"}
                    as="li"
                >
                    <CatList
                        level={level + 1}
                        parentMenu={_id!}
                        setParentMenu={setParentMenu}
                    />
                </ListGroup.Item>
            }

        </>
    );
};

export default CatRow;
