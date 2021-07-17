import { Alert, Checkbox, Icon } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import { Link } from 'umi';
import { connect } from 'dva';
import LoginComponents from './components/Login';
import styles from './style.less';
const { Tab, UserName, Password, Mobile, Captcha, Submit } = LoginComponents;

class Login extends Component {
  loginForm = undefined;
  state = {
    type: 'account',
    autoLogin: true,
  };
  changeAutoLogin = (e) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };
  handleSubmit = (err, values) => {
    const { type } = this.state;

    if (!err) {
   const{userName,password}=values;
   console.log(values)
   if(userName==='admin' && password==='tata2502'){
   this.props.history.push("/Welcome")
   }

   else{
     
     return;
   }
    }
  };
  onTabChange = (type) => {
    this.setState({
      type,
    });
  };
  onGetCaptcha = () =>
    new Promise((resolve, reject) => {
      if (!this.loginForm) {
        return;
      }

      this.loginForm.validateFields(['mobile'], {}, async (err, values) => {
        if (err) {
          reject(err);
        } else {
          const { dispatch } = this.props;

          try {
            const success = await dispatch({
              type: 'login/getCaptcha',
              payload: values.mobile,
            });
            resolve(!!success);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  renderMessage = (content) => (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );

  render() {
    const { userLogin = {}, submitting } = this.props;
    const { status, type: loginType } = userLogin;
    const { type, autoLogin } = this.state;
    return (
      <div className={styles.main}>
        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          onCreate={(form) => {
            this.loginForm = form;
          }}
        >
         
            {status === 'error' &&
              loginType === 'account' &&
              !submitting &&
              this.renderMessage(
                'UserName e Password inválidos',
              )}
            <UserName
              name="userName"
              placeholder={`${formatMessage({
                id: 'user-login.login.userName',
              })}`}
              rules={[
                {
                  required: true,
                  message:'userName é obrigatório',
                },
              ]}
            />
            <Password
              name="password"
              placeholder={`${formatMessage({
                id: 'user-login.login.password',
              })}`}
              rules={[
                {
                  required: true,
                  message: 'Password é obrigatório',
                },
              ]}
              onPressEnter={(e) => {
                e.preventDefault();

                if (this.loginForm) {
                  this.loginForm.validateFields(this.handleSubmit);
                }
              }}
            />
         
       
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              Lembrar-me
            </Checkbox>
            <a
              style={{
                float: 'right',
              }}
              href=""
            >
              Esqueceu a Senha
            </a>
          </div>
          <Submit loading={submitting}>
            <FormattedMessage id="user-login.login.login" />
          </Submit>
       
        </LoginComponents>
      </div>
    );
  }
}

export default connect(({ login, loading }) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
