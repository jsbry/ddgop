import Main from '../../pages/Main/Main';
import Containers from '../../pages/Containers/Containers';
import Images from '../../pages/Images/Images';
import Volumes from '../../pages/Volumes/Volumes';
import Builds from '../../pages/Builds/Builds';

type GProps = {
  content: string;
};


function Content(props: GProps) {
  const { content } = props;

  const renderPage = (param: string) => {
    switch (param) {
      case 'Containers':
        return <Containers></Containers>;
      case 'Images':
        return <Images></Images>;
      case 'Volumes':
        return <Volumes></Volumes>;
      case 'Builds':
        return <Builds></Builds>;
      default:
        return <Main></Main>;
    }
  };

  return (
    <main className="main">
      <h2>{content}</h2>
      {renderPage(content)}
    </main>
  )
}

export default Content
