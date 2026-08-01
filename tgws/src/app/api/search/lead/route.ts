import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { logServiceError } from '@/lib/errors';

interface LeadRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  searchQuery: string;
  gapDescription: string;
}

// 验证邮箱格式
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Escape user-controlled values before HTML interpolation (AUDIT-008).
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 发送通知邮件给管理层和销售团队
async function sendNotificationEmail(lead: LeadRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = `🔔 官网搜索发现能力缺口 - ${lead.searchQuery}`;

  const safeName = escapeHtml(lead.name);
  const safeEmail = escapeHtml(lead.email);
  const safeQuery = escapeHtml(lead.searchQuery);
  const safeGap = escapeHtml(lead.gapDescription);
  const safePhone = lead.phone ? escapeHtml(lead.phone) : '';
  const safeCompany = lead.company ? escapeHtml(lead.company) : '';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f3a5f; border-bottom: 2px solid #00D4FF; padding-bottom: 10px;">
        🔔 官网搜索监控报告
      </h2>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>⏰ 时间:</strong> ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Manila' })}</p>
        <p><strong>🔍 用户搜索:</strong> ${safeQuery}</p>
        <p><strong>📍 搜索来源:</strong> 全局搜索 - 能力缺口检测</p>
      </div>
      
      <h3 style="color: #e74c3c;">⚠️ 能力缺口检测</h3>
      <p>${safeGap}</p>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>💡 建议行动:</h4>
        <ol>
          <li>评估是否需要引入相关产品/方案</li>
          <li>联系潜在合作伙伴了解合作可能</li>
          <li>更新官网内容，添加相关解决方案</li>
          <li><strong>在48小时内联系客户</strong></li>
        </ol>
      </div>
      
      <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>📞 客户联系方式:</h4>
        <p><strong>姓名:</strong> ${safeName}</p>
        <p><strong>邮箱:</strong> ${safeEmail}</p>
        ${safePhone ? `<p><strong>电话:</strong> ${safePhone}</p>` : ''}
        ${safeCompany ? `<p><strong>公司:</strong> ${safeCompany}</p>` : ''}
      </div>
      
      <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
        此邮件由官网搜索监控系统自动发送<br>
        TechGuru Network & Data Solutions
      </p>
    </div>
  `;

  try {
    // 发送给管理层
    await resend.emails.send({
      from: 'TechGuru Search Monitor <support@techguru-it.asia>',
      to: ['regildeclaro@techguru-it.asia'], // 管理层邮箱
      subject,
      html: htmlContent,
    });

    // 发送给销售团队
    await resend.emails.send({
      from: 'TechGuru Search Monitor <support@techguru-it.asia>',
      to: ['sales@techguru-it.asia'], // 销售团队邮箱
      subject,
      html: htmlContent,
    });

    // 发送给技术团队
    await resend.emails.send({
      from: 'TechGuru Search Monitor <support@techguru-it.asia>',
      to: ['tech@techguru-it.asia'], // 技术团队邮箱
      subject,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    logServiceError({ service: 'Resend', operation: 'sendNotificationEmail', error });
    return false;
  }
}

// 发送确认邮件给客户
async function sendCustomerConfirmation(lead: LeadRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = 'Thank you for your interest in TechGuru';

  const safeName = escapeHtml(lead.name);
  const safeQuery = escapeHtml(lead.searchQuery);
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f3a5f; border-bottom: 2px solid #00D4FF; padding-bottom: 10px;">
        Thank you for your interest!
      </h2>
      
      <p>Dear ${safeName},</p>
      
      <p>Thank you for your interest in <strong>${safeQuery}</strong>. We noticed that this is an area we are actively evaluating to add to our service portfolio.</p>
      
      <p>We apologize that we don't currently have a ready solution for your needs, but we are committed to helping you find the right solution.</p>
      
      <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>📞 What happens next?</h4>
        <p>Our team will review your inquiry and contact you within <strong>48 hours</strong> to discuss your requirements and provide personalized recommendations.</p>
      </div>
      
      <p>In the meantime, you may find these resources helpful:</p>
      <ul>
        <li><a href="https://www.techguru-it.asia/en/products">Our Products & Services</a></li>
        <li><a href="https://www.techguru-it.asia/en/solutions">Industry Solutions</a></li>
        <li><a href="https://www.techguru-it.asia/en/contact">Contact Us</a></li>
      </ul>
      
      <p>Best regards,<br>
      <strong>TechGuru Team</strong><br>
      TechGuru Network & Data Solutions</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'TechGuru <support@techguru-it.asia>',
      to: lead.email,
      subject,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    logServiceError({ service: 'Resend', operation: 'sendCustomerConfirmation', error });
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadRequest = await request.json();
    const { name, email, phone, company, searchQuery, gapDescription } = body;

    // 验证必填字段（含类型 + 长度限制，AUDIT-034）
    if (
      !name || !email || !searchQuery || !gapDescription ||
      typeof name !== 'string' || typeof email !== 'string' ||
      typeof searchQuery !== 'string' || typeof gapDescription !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (name.length > 100 || searchQuery.length > 1000 || gapDescription.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Field exceeds maximum length' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 创建线索记录
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone: phone || null,
        company: company || null,
        search_query: searchQuery,
        gap_description: gapDescription,
        source: 'global_search',
        status: 'new',
      })
      .select()
      .single();

    if (leadError) {
      logServiceError({ service: 'Supabase', operation: 'createLead', error: leadError });
      return NextResponse.json(
        { success: false, error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // 发送通知邮件（异步，不阻塞响应）
    sendNotificationEmail(body).catch((err) => logServiceError({ service: 'Resend', operation: 'sendNotificationEmail', error: err }));
    
    // 发送客户确认邮件（异步，不阻塞响应）
    sendCustomerConfirmation(body).catch((err) => logServiceError({ service: 'Resend', operation: 'sendCustomerConfirmation', error: err }));

    return NextResponse.json({
      success: true,
      data: {
        leadId: lead.id,
        message: 'Thank you for your interest! Our team will contact you within 48 hours.',
      },
    });
  } catch (error) {
    logServiceError({ service: 'Search', operation: 'leadHandler', error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}