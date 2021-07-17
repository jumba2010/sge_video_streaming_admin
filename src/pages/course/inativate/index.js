import React from 'react';
import ReactDOM from 'react-dom';
import { Card, Button, message,Upload, Icon,  Badge ,Input,Statistic,Descriptions,Select,Form, Col ,Divider,Row,Alert,Result  } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import moment from 'moment';
import { notification } from 'antd';
import api from './../../../services/api';
import { USER_KEY,SUCURSAL } from "./../../../services/auth";
import styles from './index.less';
const { TextArea } = Input;


class InativateStudent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
     inativationReason:'',   
     loading:false,
     success:false,  
     student:{},
     frequency:''
    };

    this.handleChangeInput = this.handleChangeInput.bind(this); 
  } 

  componentWillMount(){
    api.get('/api/student/unique/'+this.props.match.params.id)
  .then(res => {
  let frequency=JSON.parse(localStorage.getItem('FREQUENCIES')).filter(frq=>frq.level==res.data.level)[0].description
  this.setState({student:res.data,frequency});
});

  }

  handleSelectPaymentType(paymentMethod) {
    this.setState({paymentMethod});
  }

 handleChangeInput(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
       console.log('Values:',values)       

      }
    });
  };

  confirmTransaction= async() =>{
const {inativationReason}=this.state;
if(inativationReason){
  this.setState({loading:true});
   api.put("/api/student/inativate/"+this.state.student.id, {
    payments:this.state.student.payments,registrationId:this.state.student.registration.id,carierId:this.state.student.carier.id,activatedBy:JSON.parse(localStorage.getItem(USER_KEY)).id
  }) 
  .catch(function (error) { 
    notification.error({
        description:'Erro ao Processar o o seu pedido',
        message: 'Erro ao processar o pedido',
      });  
     
  });
 
  this.setState({success:true,loading:false})
}

  }

  cancel(){
    this.props.history.push('/student/mantain')

  }

  backToPayment(){
    this.props.history.push('/student/mantain')

  }


  render() {

    const { current } = this.state;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    const extra = (
      <>
        <Button type="primary" onClick={this.backToPayment.bind(this)} >
       Listar Estudantes
         
        </Button>
       
      </>
    );
  
    return(
    <PageHeaderWrapper>
     <Card>
     {!this.state.success?

     <div>
       <Alert message="Atenção" description="Esta operação é ireversível. Informe o motivo de Anulação e clique em confirmar" type="warning" showIcon></Alert>
       <Row style={{ padding: '50px 20px' }}>
     <Descriptions title={this.state.student.name} >
    <Descriptions.Item label="Nível">{this.state.frequency}</Descriptions.Item>
    <Descriptions.Item label="Data de Nascimento">{this.state.student?moment(this.state.student.birthDate).format('YYYY-MM-DD'):''}</Descriptions.Item>
    <Descriptions.Item label="Data de Inscrição">{this.state.student?moment(this.state.student.createdAt).format('YYYY-MM-DD'):''}</Descriptions.Item>
   
      </Descriptions>
      <Divider style={{ marginBottom: 10}} />
      <Form {...formItemLayout}  onSubmit={this.handleSubmit}>
  
        <Form.Item label="Motivo de Anulação">
        {getFieldDecorator('inativationReason', {initialValue:`${this.state.inativationReason}`,
            rules: [{ required: true, message: 'Por favor informe o motivo de anulação!' }],
          })(
            <TextArea rows={5} name='inativationReason'  onChange={this.handleChangeInput} />)}      
           </Form.Item>
               
                  <Form.Item >
<Button style={{ marginLeft: 180 }} type="danger" onClick={() => this.cancel()}>
              Cancelar
            </Button>
       
            <Button style={{ marginLeft: 8 }}  loading={this.state.loading} type="primary" htmlType="submit" onClick={() => this.confirmTransaction()}>
              Confirmar
            </Button>        
        
        </Form.Item>
                 </Form>
  
  </Row></div>

  :
  <Form {...formItemLayout} style={{ padding: '50px 0' }}>
<Result
    status="success"
    title="Operação Realizada com Sucesso!"
    subTitle={`Inscrição anulada com Sucesso `}
    extra={extra}
    />
<Form.Item >

        
        </Form.Item>
      </Form>

}
            </Card></PageHeaderWrapper>
    );
  }
  
}
export default    Form.create({})(InativateStudent);