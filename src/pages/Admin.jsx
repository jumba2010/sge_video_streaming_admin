import React from 'react';
import { Card, Typography, Alert, Icon } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
export default () => (
  <PageHeaderWrapper content=" 这个页面只有 admin 权限才能查看">
    <Card>
      <Alert
        message="Bem vindo"
        type="success"
        showIcon
        banner
        style={{
          margin: -12,
          marginBottom: 48,
        }}
      />
      <Typography.Title
        level={2}
        style={{
          textAlign: 'center',
        }}
      >
        <Icon type="smile" theme="twoTone" />Course App{' '}
        <Icon type="heart" theme="twoTone" twoToneColor="#eb2f96" /> You
      </Typography.Title>
    </Card>
  
  </PageHeaderWrapper>
);
