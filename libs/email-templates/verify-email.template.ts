interface IVerifyEmailTemplateDTO {
  verifyEmailLink: string;
}

export const verifyEmailTemplate = (payload: IVerifyEmailTemplateDTO) => {
  const { verifyEmailLink } = payload;

  if (!verifyEmailLink) {
    throw new Error(`Verify email link is missing`);
  }
  return `
     <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">   
          <p>Hi there,</p> <p> Please click the link below to verify your email address. </p> <a href="${verifyEmailLink}" style=" display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px; " > Verify Email</a> <p style="margin-top: 20px;"> If you have any questions, feel free to reach out. </p> <p> Best regards,<br/> <strong>Tokenize AI</strong> </p>
      </div>
      `;
};
