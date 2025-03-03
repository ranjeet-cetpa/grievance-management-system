import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import { Paperclip, FileText, Download, ExternalLink } from 'lucide-react';

interface GrievanceDescriptionProps {
  description: string;
  attachments?: string[];
}

export const GrievanceDescription = ({ description, attachments }: GrievanceDescriptionProps) => {
  const getFileNameFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 border-gray-100">
      <CardHeader className="border-b border-gray-100 bg-gray-50/40">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary/80" />
          <Heading type={6} className="text-gray-700">
            Description
          </Heading>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div
          className="prose max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {attachments && attachments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="w-5 h-5 text-primary/80" />
              <Heading type={6} className="text-gray-700">
                Attachments ({attachments.length})
              </Heading>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="group flex items-center bg-gray-50 rounded-lg border border-gray-100 
                                             hover:border-primary/20 hover:bg-gray-50/80 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0 p-3">
                    <p className="text-sm font-medium text-gray-700 truncate" title={getFileNameFromUrl(attachment)}>
                      {getFileNameFromUrl(attachment)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Attachment {index + 1}</p>
                  </div>
                  <div className="flex items-center gap-1 pr-3">
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 
                                                     hover:text-gray-700 transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
