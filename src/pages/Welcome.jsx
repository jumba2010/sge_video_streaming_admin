import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Card, Typography, Alert } from 'antd';
import styles from './Welcome.less';

const CodePreview = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

export default () => (
  <PageHeaderWrapper>
    <Card>
    <Table
                  className="components-table-demo-nested"
                  columns={reportcolumns}
                  rowKey="id"
                  loading={this.state.sync}
                  pagination={this.state.pagination1}
                  dataSource={this.state.notifications}
                 
                />
   
    
    
    </Card>
   
  </PageHeaderWrapper>
);
