import * as React from 'react';

interface IMetaButtonProps {
  text: string;
  onClick: (event: React.MouseEvent) => any;
  child?: React.ReactElement;
}

const MetaButton: React.FunctionComponent<IMetaButtonProps> = (props) => {
  const { text, child, onClick } = props;
  // return <button className='bg-purple text-white' onClick={onClick} >{text} {child} </button>;
  return (
    <button
      onClick={onClick}
      className="btn gap-2 bg-white p-2 px-3 border-none rounded-full"
    >
      {text}
      {child}
    </button>
  );
};

export default MetaButton;
