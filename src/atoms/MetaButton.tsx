import * as React from 'react';

interface IMetaButtonProps {
  text?: string;
  onClick: (event: React.MouseEvent) => any;
  child?: React.ReactElement;
  img?: string;
  imgClass?: string;
  className?: string;
  backShadow?: boolean;
}

const MetaButton: React.FunctionComponent<IMetaButtonProps> = (props) => {
  const { text, child, onClick, img, backShadow } = props || {};
  // return <button className='bg-purple text-white' onClick={onClick} >{text} {child} </button>;
  return (
    <button
      onClick={onClick}
      className={`border-0 right-0 outline-0  rounded-full ${props.className}`}
    >
      {text}
      {img && (
        <div className="relative">
          <img src={img} alt="__" className={props.imgClass} />
          {backShadow && (
            <span className="absolute h-12 w-12 rounded-full bg-gray-dark opacity-50 top-2 left-2 z-[-1]"></span>
          )}
        </div>
      )}
      {child}
    </button>
  );
};

export default MetaButton;
