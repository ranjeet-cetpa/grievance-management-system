import styled from 'styled-components';

export const StyledNode = styled.div<{ isCommittee?: boolean; role?: string }>`
  padding: 10px 15px;
  border-radius: ${(props) => (props.isCommittee && props.role === 'Committee Member' ? '40%' : '16px')};
  border: 1px solid ${(props) => (props.isCommittee ? '#ff9800' : '#2196f3')};
  display: inline-block;
  background: ${(props) => (props.role !== 'Committee Member' ? '#ff9800' : 'white')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  text-align: center;

  &:hover {
    background: ${(props) => (props.role !== 'Committee Member' ? '#f57c00' : '#f5f5f5')};
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }
`;

export const NodeLabel = styled.div<{ role?: string }>`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.role !== 'Committee Member' ? 'white' : '#333')};
`;

export const RoleText = styled.div<{ role?: string }>`
  font-size: 12px;
  color: ${(props) => (props.role !== 'Committee Member' ? 'rgba(255, 255, 255, 0.9)' : '#666')};
`;

export const CommitteeLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  min-width: 1200px;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 20px;
    height: 2px;
    background-color: #2196f3;
  }

  &::before {
    right: calc(50% + 100px);
  }

  &::after {
    left: calc(50% + 100px);
  }
`;

export const MembersList = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  position: relative;
  justify-content: flex-end;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 20px;
    height: 2px;
    background-color: #2196f3;
  }

  &:first-child::after {
    right: -20px;
  }

  &:last-child {
    justify-content: flex-start;
    &::after {
      left: -20px;
    }
  }
`;
