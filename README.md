# ASUS Download Master Chrome Extension

Simplifies adding torrent, ed2k, ftp files to ASUS Download Master queue.
Adds context menu for every link which allows to quickly download file.

# Installation

## Download Master

Make sure you have an ASUS router with Download Master installed and running.
If Download Master not installed follow this tutorial: https://www.asus.com/support/FAQ/114001

## Options

Before you proceed you must specify several options by clicking on extension icon

* Application URL - URL to Download Master application (usually its http://router.asus.com:8081)
* Username - router admin username
* Password - router admin password

Provided credentials won't be sent anywhere and will be stored only on your current machine.

# Usage

Right-click on any link and select 'Download with ASUS Download Master'. 
Torrent files are auto-detected so you don't need to worry about this.
You will see notification about success or error.

# Supported versions

Tested on RT-AC88U and Download Master ver. 3.1.0.104

# Sources

It's opensource, so you can make sure you are safe :)

https://github.com/acc15/asus-downloader-chrome

# Changelog

## 1.2.0

* Added more intermediate statuses (adding task to DM, logging in DM, DM request timeout) 
* Added timeouts to all requests (tasks won't hang forever)
* Added options to customize request timeouts

## 1.1.0

* Fixed duplicate creation of contextMenu item
* Improved notifications - they now tracks progress while queueing URL
* Improved UTF-8 support for .torrent downloads
* Added progressbar for .torrent downloads
* Added colored icons (red - error, green - success and yellow - warning) to notifications
* Added notification timeout option (default is 5 seconds)
* Improved Download Master authentication flow - login requests now will be sent only when they are actually needed
* Improved option page HTML layout
* Fixed Download Master .torrent confirmation (by using .torrent filename directly from Download Master)

## 1.0.0

* Plugin was rewritten using Manifest V3
* It now uses fetch API instead of old XMLHttpRequest

## 0.0.6

* Improved Magnet URL handling
* Fixed error message when USB drive is full (no space left for new downloads) - before it was "Unknown error"
* Several minor fixes

## 0.0.5

* Added button to notifications which allows quickly navigate to Download Master
* Added button to options page to allow test entered credentials and URL
* Cosmetics

## 0.0.4

* Fixed an issue with multifile torrents which wasn't actually downloaded

## 0.0.3

* Fixed an issue which causes "Unknown error" message.
* Actually this message means duplicate torrent file (Torrent file was already added to download queue).

## 0.0.2

* Improved .torrent detection
* Fixed success message when ASUS Download Master task limit reached (max 30 active tasks)