import React, { useContext, useReducer, useState } from "react";
import { InformationContextType } from "../../types/context";
import InformationActionFactory from "./action";
import { State, Reducer } from "./state";

// NOTE: This legacy context remains for backward compatibility. New feature
// implementation uses src/features/information hooks and services. We keep the
// provider until all consumers are migrated.

const InformationContext = React.createContext<InformationContextType | null>(null);
const InformationDispatch = React.createContext<any>(null);

interface IProps {
  children: React.ReactNode;
}

export function InformationContextProvider(props: IProps) {
  const { children } = props;
  // initialize state using the State factory to avoid passing props as initialArg
  const initial = State();
  const [value, dispatch] = useReducer(Reducer, initial);
  const [actions] = useState(InformationActionFactory(dispatch));
  return (
    <InformationContext.Provider value={value}>
      <InformationDispatch.Provider value={actions}>
        {children}
      </InformationDispatch.Provider>
    </InformationContext.Provider>
  );
}

export function useInformationContext() {
  const state = useContext(InformationContext);
  const actions = useContext(InformationDispatch);
  if (!state || !actions) {
    // keep behavior unchanged for now; callers may expect nullable values
    return [state, actions];
  }
  return [state, actions];
}
