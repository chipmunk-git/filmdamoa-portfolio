import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin: ${({ styleProps }) => styleProps.wrapperMargin || '1rem 0'};
`

const Label = styled.div`
  font-size: ${({ theme, styleProps }) => styleProps.labelFontSize || theme.fontSize.regular};
  font-weight: ${({ styleProps }) => styleProps.fontWeight || 'normal'};
  margin: ${({ styleProps }) => styleProps.labelMargin || '0 0 0.375rem'};
`

const StyledInput = styled.input`
  width: 100%;
  height: 2.5rem;
  border: 1px solid ${({ theme }) => theme.colors.greyLight};
  border-radius: 0;
  outline: none;
  line-height: 2.25rem;
  font-size: ${({ theme, styleProps }) => styleProps.inputFontSize || theme.fontSize.large};
  padding-left: 0.5rem;
  padding-right: 0.5rem;
`

// input 및 임의의 label을 포함하는 컴포넌트
const InputWithLabel = ({ label, styleProps, ...rest }) => {
  return (
    <Wrapper styleProps={styleProps}>
      <Label styleProps={styleProps}>{label}</Label>
      <StyledInput styleProps={styleProps} {...rest} />
    </Wrapper>
  );
}

InputWithLabel.defaultProps = {
  styleProps: {}
};

export default React.memo(InputWithLabel);