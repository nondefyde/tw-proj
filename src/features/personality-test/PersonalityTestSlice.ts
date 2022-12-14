import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchQuestion } from './question-set/questionsAPI';
import { AnswerType, QuestionType, ResultType } from './question-set/question';
import { resultData } from './data';
import { RootState } from '../../app/store';

export interface QuestionSetState {
  questions: QuestionType[];
  current?: QuestionType;
  currentIndex: number;
  answers: Record<string, AnswerType>;
  isFinished: boolean;
  status: 'idle' | 'loading' | 'failed';
  result?: ResultType;
}

const initialState: QuestionSetState = {
  questions: [],
  currentIndex: 0,
  current: undefined,
  answers: {},
  status: 'idle',
  isFinished: false,
  result: undefined
};

export const fetchQuestionAsync = createAsyncThunk(
  'questions/fetchQuestions',
  async () => {
    const response = await fetchQuestion();
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const personalityTestSlice = createSlice({
  name: 'personalityTest',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    selectNextQuestion: (state, action: PayloadAction<string>) => {
      const index = state.currentIndex + 1
      if (state.questions[index]) {
        state.current = state.questions[index];
        state.currentIndex = index;
      } else {
        state.isFinished = true;
         const rand = Math.floor(Math.random() * 10);
        state.result = rand % 2 ? resultData[0] : resultData[1];
      }
    },
    selectPreviousQuestion: (state) => {
      const index = state.currentIndex - 1
      if(state.questions[index]) {
        state.current = state.questions[index];
        state.currentIndex = index;
      }
    },
    answerQuestion: (state, action: PayloadAction<AnswerType>) => {
      state.answers[action.payload.questionId] = action.payload;
    },
  
    resetTest: (state) => {
      state.current = undefined;
      state.currentIndex = 0;
      state.answers = {};
      state.isFinished = false;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuestionAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.questions = action.payload;
        if(action.payload.length) {
          state.current = state.questions[0];
          state.currentIndex = 0;
        }
      })
      .addCase(fetchQuestionAsync.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const selectResult = (state: RootState) => state.personalityTest.result;

export const { answerQuestion, resetTest, selectNextQuestion, selectPreviousQuestion } = personalityTestSlice.actions;

export default personalityTestSlice.reducer;
