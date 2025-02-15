import axios from 'axios';

export const fetchQuestions = (status, username, language) => async (dispatch) => {
    dispatch({ type: 'FETCH_QUESTIONS_REQUEST' });
    try {
        const response = await axios.get(`/get/${status}/questions`, {
            params: { username, language },
        });
        dispatch({ type: 'FETCH_QUESTIONS_SUCCESS', payload: response.data });
    } catch (error) {
        dispatch({ type: 'FETCH_QUESTIONS_FAILURE', payload: 'Failed to fetch questions.' });
        console.error('Error fetching questions:', error);
    }
};




export const selectQuestion = (question) => ({
    type: 'SET_SELECTED_QUESTION',
    payload: question,
});

export const runCode = (language, code, questionId) => async (dispatch) => {
    try {
        const response = await axios.post('/api/execute', { language, code, questionId });
        dispatch({ type: 'SET_OUTPUT', payload: response.data.output });
    } catch (error) {
        console.error('Error executing code:', error);
        dispatch({ type: 'SET_OUTPUT', payload: 'Error executing code. Please try again.' });
    }
};
