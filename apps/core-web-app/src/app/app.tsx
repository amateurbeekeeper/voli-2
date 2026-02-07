import { Provider } from 'react-redux';
import { store } from '../store';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { increment, decrement } from '../store/slices/counterSlice';
import { Button } from '@voli/design-system';

function Counter() {
  const count = useAppSelector((s) => s.counter.value);
  const dispatch = useAppDispatch();
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button variant="outline" size="sm" onClick={() => dispatch(decrement())}>
        −
      </Button>
      <span>{count}</span>
      <Button variant="outline" size="sm" onClick={() => dispatch(increment())}>
        +
      </Button>
    </div>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <div style={{ padding: 24, fontFamily: 'var(--font-stack)' }}>
        <h1>Core Web App</h1>
        <Counter />
      </div>
    </Provider>
  );
}

export default App;
