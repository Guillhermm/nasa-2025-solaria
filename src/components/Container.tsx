import { ReactNode } from 'react';
import { Container as BSContainer } from 'react-bootstrap';

export const Container = ({ children }: { children: ReactNode }) => (
  <BSContainer className="py-5">{children}</BSContainer>
);
