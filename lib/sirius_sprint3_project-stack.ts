import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import * as lambda_ from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from "path";

export class SiriusSprint3ProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let role = this.create_role();
    let layer = this.createLayer('lambda_layer',path.join(__dirname,'../layers'))
    let api_backend = this.createLambda('lambda_api_backend',path.join(__dirname,'../resources/api_backend'),'api_backend.handler',role,layer)

    const api = new apigateway.LambdaRestApi(this,'Fahad-API',{handler: api_backend});

  }
  createLambda(id:string, asset:string,handler:string,role:any,layer:any){
    return new lambda_.Function(this,id,{
                                      code: lambda_.Code.fromAsset(asset),
                                      runtime:lambda_.Runtime.NODEJS_18_X,
                                      handler: handler,
                                      timeout :Duration.minutes(5),
                                      layers : [layer],
                                      role : role
                                      });
  }

  create_role(this:any){
    const role = new iam.Role(this,"lambda_role",{assumedBy:new iam.ServicePrincipal("lambda.amazonaws.com")});
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess"));
    return role;
 
  }


  createLayer(id:string, asset:string){
    return new lambda_.LayerVersion(this,id,{code:lambda_.Code.fromAsset(asset),compatibleRuntimes:[lambda_.Runtime.NODEJS_18_X]});
  } 
}
