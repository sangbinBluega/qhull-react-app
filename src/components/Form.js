import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Axios from 'axios';

const TokenItem = React.memo(({ token, onRemove }) => {
    const { id, val } = token;
    return (
        <li>
            <span>{val}</span>{' '}
            <button onClick={() => onRemove(id)}>삭제</button>
        </li>
    );
});

const TokenItems = React.memo(({ tokens, onRemove }) =>
    tokens.map(token => (
        <TokenItem
            key={token.id}
            token={token}
            onRemove={onRemove}
        />
    ))
);

const useStyles = makeStyles(theme => ({
    textField: {
        '& label': {
            color: 'gray'
        },
        '& label.Mui-focused': {
            color: 'white',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: 'gray',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'gray',
            },
            '&:hover fieldset': {
                borderColor: 'gray',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'gray',
            },
        }
    },
    button: {
        color: 'white',
        borderColor: 'white'
    },
}));



const Form = ({ input_title, input_message, input_token, onChange_title, onChange_message, onChange_token, onRemove, onSubmit, tokens, onUpload }) => {

    const classes = useStyles();

    const state = useSelector(state => state.form, []);

    // 이 함수는 render 가 마치고 난 다음에 실행됩니다!
    useEffect(() => {
        //console.error('render after');
        if (state.selectedFile !== null) {

            const data = new FormData();
            data.append('file', state.selectedFile);
            Axios.post("http://localhost:3000/upload", data, { // receive two parameter endpoint url ,form data 
            })
            .then(res => { // then print response status
                if (res.data !== "") {
                    alert('업로드 성공');
                }
                else {
                    alert('파일을 선택 해주시기 바랍니다.');
                }
            })
        }
        return () => {
            //console.error('render before');
        }
    }, [state.selectedFile]);
    // 아예 없으면 모든 render 체크
    // [] didmount
    // [val] 특정 값만

    const sendMsg = () => {
        Axios.get(`http://localhost:3000/send?title=${state.input_title}&msg=${state.input_message}`, {
        })
        .then(res => { // then print response status
            console.error(res);
        })
    };

    return (
        <React.Fragment>
            <Grid container direction="column" justify="center" alignItems="center">
                <Grid item xs={12}>
                    JSON KEY 파일 : <input type="file" name="file" onChange={onUpload} />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="outlined-name"
                        label="Title"
                        margin="normal"
                        variant="outlined"
                        className={classes.textField}
                        onChange={onChange_title}
                        value={input_title}
                        inputProps={{ style: { color: 'white' } }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="outlined-name"
                        label="message"
                        margin="normal"
                        variant="outlined"
                        className={classes.textField}
                        onChange={onChange_message}
                        value={input_message}
                        inputProps={{ style: { color: 'white' } }}
                    />
                </Grid>
                <Grid item xs={12}>

                    <form onSubmit={onSubmit}>

                        <TextField
                            id="outlined-name"
                            label="token"
                            margin="normal"
                            variant="outlined"
                            onChange={onChange_token}
                            value={input_token}
                            className={classes.textField}
                            inputProps={{ style: { color: 'white' } }}
                        />

                        <Button variant="contained" color="default" type="submit">
                            Add
                        </Button>

                    </form>

                    <ul>
                        <TokenItems tokens={tokens} onRemove={onRemove} />
                    </ul>

                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={sendMsg}>
                        Send
                </Button>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default Form;