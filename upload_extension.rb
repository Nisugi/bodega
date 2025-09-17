# Upload Extension for Bodega Script
# Add this to the end of bodega.lic before the final "end"

module Bodega
  module Uploader
    # Upload configuration
    UPLOAD_URL = "YOUR_UPLOAD_ENDPOINT_HERE"  # Replace with actual endpoint

    def self.upload_all_files
      return if Opts["dry-run"]

      Log.out("Starting upload process...", label: :upload)

      begin
        require 'net/http'
        require 'uri'
        require 'json'

        # Get all JSON files
        files = Assets.cached_files()

        if files.empty?
          Log.out("No files to upload", label: :upload)
          return
        end

        files.each do |file|
          upload_file(file)
        end

        # Also upload manifest
        if File.exist?(Assets.local_path("manifest.json"))
          upload_file("manifest.json")
        end

        Log.out("Upload complete!", label: :upload)

      rescue => exception
        Log.out("Upload failed: #{exception.message}", label: :upload)
        Log.out(exception.backtrace.join("\n"), label: :upload)
      end
    end

    def self.upload_file(filename)
      file_path = Assets.local_path(filename)

      unless File.exist?(file_path)
        Log.out("File not found: #{filename}", label: :upload)
        return
      end

      Log.out("Uploading #{filename}...", label: :upload)

      # For GitHub Pages / Static hosting approach
      upload_to_github(filename, file_path)
    end

    def self.upload_to_github(filename, file_path)
      # This is a placeholder for GitHub API upload
      # You would need to:
      # 1. Set up a GitHub repository
      # 2. Get a GitHub API token
      # 3. Use the GitHub Contents API to upload files

      # For now, just copy to a local "upload" directory
      upload_dir = Assets.local_path("../upload")
      Dir.mkdir(upload_dir) unless Dir.exist?(upload_dir)

      require 'fileutils'
      FileUtils.cp(file_path, File.join(upload_dir, filename))

      Log.out("Copied #{filename} to upload directory", label: :upload)
    end

    def self.upload_to_ftp(filename, file_path)
      # FTP upload example (like the old playershops script)
      require 'net/ftp'

      ftp_host = ENV['BODEGA_FTP_HOST'] || 'your-server.com'
      ftp_user = ENV['BODEGA_FTP_USER'] || 'username'
      ftp_pass = ENV['BODEGA_FTP_PASS'] || 'password'

      ftp = Net::FTP.new(ftp_host, ftp_user, ftp_pass)
      ftp.passive = true
      ftp.putbinaryfile(file_path, filename)
      ftp.close

      Log.out("Uploaded #{filename} via FTP", label: :upload)
    end

    def self.upload_to_webhook(filename, file_path)
      # Simple HTTP POST upload
      uri = URI(UPLOAD_URL)

      File.open(file_path, 'rb') do |file|
        request = Net::HTTP::Post.new(uri)
        request['Content-Type'] = 'application/json'
        request['X-Filename'] = filename
        request.body = file.read

        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
          http.request(request)
        end

        if response.code.to_i >= 200 && response.code.to_i < 300
          Log.out("Uploaded #{filename} successfully", label: :upload)
        else
          Log.out("Upload failed for #{filename}: #{response.code} #{response.message}", label: :upload)
        end
      end
    end
  end
end

# Add upload option to CLI help
module Bodega
  module CLI
    def self.help_menu_with_upload
      original_help = help_menu

      upload_help = <<~UPLOAD_HELP

        upload mode:
          --upload              upload generated JSON files after parsing
          --upload-method=TYPE  specify upload method (github, ftp, webhook)
      UPLOAD_HELP

      original_help.gsub("search mode:", upload_help + "\n        search mode:")
    end
  end
end

# Modify the CLI section to handle upload
if Opts.parser
  Log.out(Opts.to_h, label: :opts)
  Bodega::Parser.to_json()  if (Opts.save or Opts["dry-run"])
  Bodega::Parser.manifest() if Opts.manifest

  # Auto-upload after parsing if requested
  if Opts.upload and (Opts.save or Opts["dry-run"])
    Bodega::Uploader.upload_all_files
  end
end

=begin

USAGE EXAMPLES:

# Basic usage with upload
;bodega --parser --save --upload

# Specific town with upload
;bodega --parser --town=wehnimer --save --upload

# Test run (no upload)
;bodega --parser --dry-run

# Create manifest and upload
;bodega --parser --save --manifest --upload

SETUP INSTRUCTIONS:

1. For simple local testing:
   - Files are copied to bodega/upload/ directory
   - You can then manually copy to your hosting

2. For FTP upload:
   - Set environment variables:
     set BODEGA_FTP_HOST=your-server.com
     set BODEGA_FTP_USER=username
     set BODEGA_FTP_PASS=password
   - Modify upload_to_ftp method as needed

3. For GitHub Pages:
   - Create a GitHub repository
   - Get a GitHub personal access token
   - Modify upload_to_github to use GitHub API

4. For webhook/API:
   - Set UPLOAD_URL constant to your endpoint
   - Modify upload_to_webhook as needed

=end