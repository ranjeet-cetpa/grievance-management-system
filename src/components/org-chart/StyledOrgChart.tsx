import styled from 'styled-components';

export const StyledNode = styled.div<{ role?: string }>`
  padding: 10px 15px;
  border-radius: 16px;
  border: 1px solid
    ${(props) => (props.role === 'Committee Group ' || props.role === 'Committee Member' ? '#ff9800' : '#2196f3')};
  display: inline-block;
  background: ${(props) => (props.role === 'Committee Member' ? 'white' : '#0d56c5')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 20px;
  text-align: center;

  &:hover {
    background: ${(props) => (props.role === 'Committee Member' ? '#f5f5f5' : 'royalblue')};
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }
`;

export const NodeLabel = styled.div<{ role?: string }>`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.role === 'Committee Member' ? '#333' : 'white')};
`;

export const RoleText = styled.div<{ role?: string }>`
  font-size: 12px;
  color: ${(props) => (props.role === 'Committee Member' ? '#666' : 'rgba(255, 255, 255, 0.9)')};
`;

export const CommitteeLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 40px;
  align-items: center;
  min-width: 800px;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40px;
    height: 2px;
    background-color: #ff9800;
  }

  &::before {
    right: calc(500% + 1px);
  }

  &::after {
    left: calc(500% + 1px);
  }
`;

export const MembersList = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  position: relative;
  justify-content: flex-end;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 20px;
    height: 2px;
    background-color: #ff9800;
  }

  &:first-child::after {
    right: -30px;
  }

  &:last-child {
    justify-content: flex-start;
    &::after {
      left: -30px;
    }
  }
`;
