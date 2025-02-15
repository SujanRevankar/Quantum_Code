const initialState = {
    questions: [],
    selectedQuestion: null,
    code: '',
    language: 'Java',
    output: '',
    loading: false, // New loading state
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_QUESTIONS':
            return { ...state, questions: action.payload, loading: false };
        case 'SET_SELECTED_QUESTION':
            return { ...state, selectedQuestion: action.payload, code: '', output: '' };
        case 'SET_CODE':
            return { ...state, code: action.payload };
        case 'SET_LANGUAGE':
            return { ...state, language: action.payload };
        case 'SET_OUTPUT':
            return { ...state, output: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
            case 'FETCH_QUESTIONS_REQUEST':
                return { ...state, loading: true };
            case 'FETCH_QUESTIONS_SUCCESS':
                return { ...state, questions: action.payload, loading: false };
            case 'FETCH_QUESTIONS_FAILURE':
                return { ...state, error: action.payload, loading: false };
            
            // reducer.js
        default:
            return state;
    }
};
