import { ASSETS } from '../../constants/assets';
import IconButton from './IconButton';

function HomeButton() {
  return (
    <IconButton
      onClick={() => window.location.reload()}
      img={ASSETS['home']}
    />
  );
}

export default HomeButton;
