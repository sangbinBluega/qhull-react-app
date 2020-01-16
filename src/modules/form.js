const RUN_Q_SET_Ui = 'form/RUN_Q_SET_Ui';

const initalState = {
    url : ''
};

const form = (state = initalState, action) => {
    
    switch (action.type) {
        case RUN_Q_SET_Ui:
            return {
                ...state,
                url: action.payload
            };

        default:
            return state;
    }
}

export default form;