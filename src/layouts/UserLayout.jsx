import { DefaultFooter, getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet } from 'react-helmet';
import { Link } from 'umi';
import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import styles from './UserLayout.less';

const UserLayout = (props) => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    breadcrumb,
    formatMessage,
    ...props,
  });
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
       
        <div className={styles.content}>
        <div style={{ margin: '0px 10px 10px 35%' }}>
            <div className={styles.header} style={{ 'margin-lef': '150px' }}>
              <Link to="/">
               
                <span className={styles.title}>Aulas Online</span>
              </Link>
            </div>
            <div className={styles.desc}>Entre com as suas credencias</div>
          </div>
          {children}
        </div>
     
      </div>
    </>
  );
};

export default connect(({ settings }) => ({ ...settings }))(UserLayout);
