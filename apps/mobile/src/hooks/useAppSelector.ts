import { TypedUseSelectorHook, useSelector } from 'react-redux';
import type { RootState } from '../core/store';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
