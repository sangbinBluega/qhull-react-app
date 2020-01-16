import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from '../components/Form';

const FormContainer = () => {

    const dispatch = useDispatch();
    const { input_title, input_message, input_token, tokens } = useSelector(state => state.form, []);

    const onChange_title = useCallback(
        e => {
            dispatch({ type: 'form/CHANGE_INPUT_TITLE', payload: e.target ? e.target.value : e })
        },
        [dispatch]
    );

    const onChange_message = useCallback(
        e => {
            dispatch({ type: 'form/CHANGE_INPUT_MESSAGE', payload: e.target ? e.target.value : e })
        },
        [dispatch]
    );

    const onChange_token = useCallback(
        e => {
            dispatch({ type: 'form/CHANGE_INPUT_TOKEN', payload: e.target ? e.target.value : e })
        },
        [dispatch]
    );

    const onInsert = useCallback(
        token => {
            dispatch({ type: 'form/INSERT_TOKEN', payload: token });
        },
        [dispatch]
    );

    const onUpload = useCallback(
        e =>
            dispatch({ type: 'form/UPLOAD', payload: e.target.files[0] }),
        [dispatch]
    );

    const onRemove = useCallback(
        id => dispatch({ type: 'form/REMOVE', payload: id }),
        [dispatch]
    );

    const onSubmit = useCallback(
        e => {
            e.preventDefault();
            onChange_token('');
            onInsert(input_token);
        },
        [input_token, onChange_token, onInsert]
    );

    return (
        <Form
            input_title={input_title}
            input_message={input_message}
            input_token={input_token}
            onChange_title={onChange_title}
            onChange_message={onChange_message}
            onChange_token={onChange_token}
            tokens={tokens}
            onSubmit={onSubmit}
            onRemove={onRemove}
            onUpload={onUpload}
        />
    )
}

export default FormContainer;