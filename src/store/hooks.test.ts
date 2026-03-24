const mockUseDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockUseDispatch(),
  useSelector: jest.fn(),
}));

import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from './hooks';

describe('store hooks', () => {
  it('returns the typed dispatch hook result', () => {
    const dispatch = jest.fn();
    mockUseDispatch.mockReturnValue(dispatch);

    expect(useAppDispatch()).toBe(dispatch);
  });

  it('re-exports useSelector as useAppSelector', () => {
    expect(useAppSelector).toBe(useSelector);
  });
});
