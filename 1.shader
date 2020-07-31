// Upgrade NOTE: replaced '_World2Object' with 'unity_WorldToObject'
// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "MyShader/1"
{
    Properties{
        _Diffuse ("Diffuse Color",color) = (1,1,1,1)//自身颜色
        _Spec ("Specular",range(1,20)) = 10//高光亮度
        _MainTex("Texture",2D) = "white"{}//纹理
        [ToggleOff] _NotUseDiff ("notUseDiff",Float) = 0
    }
    SubShader
    {

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "UnityCG.cginc"
            #include "Lighting.cginc"

            float4 _Diffuse;
            float _Spec;
            float _NotUseDiff;
            
            struct appdata
            {
                float4 vertex : POSITION;//系统自动获取
                fixed3 normal : NORMAL;
                float2 texcoord : TEXCOORD0;//系统自动获取
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                float3 col : COLOR;
                float2 uv: TEXCOORD0;
                float3 diff : COLOR1;
            };

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                //法线
                float3 normal = normalize(mul(v.normal,(float3x3)unity_WorldToObject));
                //入射光
                float3 light =  normalize(_WorldSpaceLightPos0.xyz);
                //环境光
                float3 ambient = UNITY_LIGHTMODEL_AMBIENT;
                //反射光
                float3 reflectD = normalize(reflect(-light,normal));
                //视角
                float3 viewD = normalize(_WorldSpaceCameraPos.xyz-mul(v.vertex,unity_WorldToObject));
                //平行光与视角的平分线
                float3 halfD = normalize(light + viewD);
                //高光,dot:反射光和视角的夹角
                float3 spec = _LightColor0.rgb * pow(max(dot(reflectD,viewD),0),_Spec);
                //Phong模型,dot:法线和（平行光与视角）的平分线的夹角
                float3 spec1 = _LightColor0.rgb * pow(max(dot(normal,halfD),0),_Spec);
                //lambert,dot：入射光和法线夹角
                float3 diffuse = _LightColor0.rgb * max(0,dot(light,normal)) * _Diffuse;
                //half lamberrt
                float3 diffuse1 = _LightColor0 * (dot(light,normal)*0.5+0.5) * _Diffuse;

                o.uv = v.texcoord;
                o.diff = diffuse;
                o.col = diffuse + ambient + spec;
                return o;
            }

            sampler2D _MainTex;

            fixed4 frag (v2f i) : SV_Target
            {
                if(_NotUseDiff)
                {
                    float3 texColor = tex2D(_MainTex,i.uv);
                    i.col -= i.diff;//用纹理来代替漫反射,暂时无法判断是否赋值了图片
                    i.col += texColor;
                }
                return float4(i.col,1);
            }
            ENDCG
        }
    }
    FallBack "VertexLit"
}
