import * as React from 'react';

interface IMetaButtonProps {
  text?: string;
  onClick: (event: React.MouseEvent) => any;
  child?: React.ReactElement;
  img?: string;
  imgClass?: string;
  className?: string;
}

const MetaButton: React.FunctionComponent<IMetaButtonProps> = (props) => {
  const { text, child, onClick, img } = props || {};
  // return <button className='bg-purple text-white' onClick={onClick} >{text} {child} </button>;
  return (
    <button
      onClick={onClick}
      className={`bg-gray-dark   border-none rounded-full ${props.className}`}
    >
      {text}
      {img && <img src={img} alt="__" className={props.imgClass} />}
      {child}
    </button>
  );
};

export default MetaButton;
